import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import type { TFunction } from "i18next";
import { ApiError } from "@/api/client";
import { useCreateBooking } from "@/api/generated/hooks/bookingsHooks/useCreateBooking";
import { useListMyBookings } from "@/api/generated/hooks/bookingsHooks/useListMyBookings";
import type { ListMyBookings200StatusEnumKey } from "@/api/generated/types/ListMyBookings";
import { BOOKINGS } from "@/api/modules/bookings";
import { PixVoucher } from "@/components/booking/pix-voucher";
import { ScreenContainer } from "@/components/layout/screen-container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Text } from "@/components/ui/text";
import { Toast } from "@/components/ui/toast";
import { useToast } from "@/hooks/common/use-toast";
import { minutesToTime } from "@/lib/datetime/format";
import { formatCentsToBRL } from "@/lib/money";
import { colors } from "@/lib/theme";

/** Enquanto o pagamento não resolve, o `status` fica em `pending_payment` — poll a cada 3s. */
const POLL_INTERVAL_MS = 3000;

/** Status finais — parar de repetir a consulta a `GET /bookings/mine`. */
const TERMINAL_STATUSES: ReadonlySet<ListMyBookings200StatusEnumKey> = new Set([
  "confirmed",
  "expired",
  "cancelled",
  "rejected",
  "completed",
]);

type Phase =
  | "creating"
  | "error"
  | "requested"
  | "payment-unavailable"
  | "pix-pending"
  | "pix-confirmed"
  | "pix-failed";

/**
 * Traduz o erro de `POST /bookings` numa mensagem amigável — os códigos vêm
 * do catálogo do backend (`ERRORS.md`/`catalog.ts`): `BKG-T0002` (slot já
 * ocupado, corrida vencida por outro usuário), `CON-T0004` (dono da quadra
 * ainda sem Connect pronto pra receber) e `BIL-T0001` (Stripe desligado no
 * deploy — bypass revisor/ambiente sem billing). Qualquer outro erro cai no
 * genérico.
 */
function resolveCreateBookingError(error: unknown, t: TFunction<"booking">): string {
  if (error instanceof ApiError) {
    const code = (error.data as { code?: string } | undefined)?.code;
    if (code === "BKG-T0002") return t("reserve.errors.slotUnavailable");
    if (code === "CON-T0004") return t("reserve.errors.notReady");
    if (code === "BIL-T0001") return t("reserve.errors.billingDisabled");
  }
  return t("reserve.errors.generic");
}

/**
 * Checkout de uma reserva (Task A2) — chamada de `court/[id]/availability.tsx`
 * (`handleReserve`) já com o horário escolhido. Cria a reserva
 * (`POST /bookings`) assim que a tela monta (o usuário já confirmou o
 * horário na tela anterior) e ramifica pela resposta:
 *
 * - `payment` ausente (`bookingMode: "request"`): reserva fica `requested`,
 *   aguardando o dono da quadra aprovar — sem PIX, sem polling aqui.
 * - `payment.pix` presente (`instant`/`deposit`): mostra o voucher PIX e faz
 *   *poll* de `GET /bookings/mine` até o status sair de `pending_payment`
 *   (confirmado pelo webhook do Stripe do lado do backend) — `confirmed` vira
 *   sucesso; qualquer outro status terminal (`expired`/`cancelled`/`rejected`/
 *   `completed`) vira falha com opção de tentar de novo.
 *
 * As fases são mutuamente exclusivas (`Phase`) — evita, por exemplo, o card
 * de erro antigo continuar visível junto com o spinner de uma nova tentativa.
 */
export default function CourtReserveScreen() {
  const params = useLocalSearchParams<{
    id: string;
    name?: string;
    date: string;
    startMinute: string;
    endMinute: string;
  }>();
  const router = useRouter();
  const { t } = useTranslation(["booking", "common"]);
  const toast = useToast();
  const queryClient = useQueryClient();

  const courtId = params.id;
  const date = params.date;
  const startMinute = Number(params.startMinute);
  const endMinute = Number(params.endMinute);
  const timeRangeLabel = `${minutesToTime(startMinute)}–${minutesToTime(endMinute)}`;

  // Reservar com sucesso ocupa um slot que a tela de disponibilidade
  // (`court/[id]/availability.tsx`) ainda tem em cache como livre — invalida
  // a query desse par quadra+data pra o slot recém-reservado parar de
  // aparecer disponível ao voltar (débito deixado pela Task A2).
  const createBooking = useCreateBooking({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: BOOKINGS.availabilityQueryKey(courtId, date) });
      },
    },
  });
  const attemptedRef = useRef(false);

  function requestBooking() {
    // `reset()` limpa `data`/`error` da tentativa anterior antes de disparar a
    // próxima — sem isto, um retry após falha/expiração renderizaria o card
    // antigo (erro ou PIX expirado) junto com o spinner de "confirmando".
    createBooking.reset();
    createBooking.mutate({ data: { courtId, date, startMinute, endMinute } });
  }

  // Dispara a criação uma única vez ao montar — o usuário já decidiu o
  // horário na tela anterior, então este checkout já "confirma" ao abrir.
  useEffect(() => {
    if (attemptedRef.current) return;
    attemptedRef.current = true;
    requestBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dispara só uma vez, na montagem
  }, []);

  const bookingId = createBooking.data?.booking.id;
  const payment = createBooking.data?.payment;
  const isPixFlow = Boolean(payment?.pix);

  const myBookingsQuery = useListMyBookings({
    query: {
      enabled: Boolean(bookingId) && isPixFlow,
      refetchInterval: (query) => {
        const list = query.state.data ?? [];
        const current = list.find((booking) => booking.id === bookingId);
        return current && TERMINAL_STATUSES.has(current.status) ? false : POLL_INTERVAL_MS;
      },
    },
  });

  const liveStatus = myBookingsQuery.data?.find((booking) => booking.id === bookingId)?.status;

  const phase: Phase = createBooking.isError
    ? "error"
    : !createBooking.isSuccess
      ? "creating"
      : !payment
        ? "requested"
        : !payment.pix
          ? "payment-unavailable"
          : liveStatus === "confirmed"
            ? "pix-confirmed"
            : liveStatus && TERMINAL_STATUSES.has(liveStatus)
              ? "pix-failed"
              : "pix-pending";

  const priceLabel = createBooking.data
    ? formatCentsToBRL(createBooking.data.booking.priceCents)
    : null;

  return (
    <ScreenContainer className="gap-6">
      <ScreenHeader
        title={t("booking:reserve.title")}
        subtitle={params.name}
        onBack={() => router.back()}
      />

      {toast.message ? (
        <Toast variant={toast.variant} onDismiss={toast.dismiss}>
          {toast.message}
        </Toast>
      ) : null}

      <Text className="font-body-medium text-ink">
        {priceLabel
          ? t("booking:reserve.summary", { time: timeRangeLabel, price: priceLabel })
          : timeRangeLabel}
      </Text>

      {phase === "creating" ? (
        <Card className="items-center gap-3 py-10" testID="reserve-creating">
          <ActivityIndicator color={colors.primary} size="large" />
          <Text variant="muted">{t("booking:reserve.creating")}</Text>
        </Card>
      ) : null}

      {phase === "error" ? (
        <Card className="gap-3" testID="reserve-error">
          <Text className="font-body-medium text-ink">
            {resolveCreateBookingError(createBooking.error, t)}
          </Text>
          <Button onPress={requestBooking}>{t("common:actions.retry")}</Button>
        </Card>
      ) : null}

      {phase === "requested" ? (
        <Card className="items-center gap-3" testID="reserve-requested">
          <Text variant="display" className="text-center text-xl">
            {t("booking:reserve.requested.title")}
          </Text>
          <Text variant="muted" className="text-center">
            {t("booking:reserve.requested.description")}
          </Text>
          <Button onPress={() => router.back()}>{t("common:actions.ok")}</Button>
        </Card>
      ) : null}

      {phase === "payment-unavailable" ? (
        <Card className="gap-3" testID="reserve-payment-unavailable">
          <Text className="font-body-medium text-ink">
            {t("booking:reserve.errors.paymentUnavailable")}
          </Text>
          <Button onPress={requestBooking}>{t("common:actions.retry")}</Button>
        </Card>
      ) : null}

      {phase === "pix-confirmed" ? (
        <Card className="items-center gap-3" testID="reserve-confirmed">
          <Text variant="display" className="text-center text-xl">
            {t("booking:reserve.confirmed.title")}
          </Text>
          <Text variant="muted" className="text-center">
            {t("booking:reserve.confirmed.description")}
          </Text>
          <Button onPress={() => router.back()}>{t("booking:reserve.confirmed.cta")}</Button>
        </Card>
      ) : null}

      {phase === "pix-failed" ? (
        <Card className="items-center gap-3" testID="reserve-failed">
          <Text variant="display" className="text-center text-xl">
            {liveStatus === "expired"
              ? t("booking:reserve.expired.title")
              : t("booking:reserve.cancelled.title")}
          </Text>
          <Text variant="muted" className="text-center">
            {liveStatus === "expired"
              ? t("booking:reserve.expired.description")
              : t("booking:reserve.cancelled.description")}
          </Text>
          <Button onPress={requestBooking}>{t("common:actions.retry")}</Button>
        </Card>
      ) : null}

      {phase === "pix-pending" && payment?.pix ? (
        <View className="gap-4" testID="reserve-pix-pending">
          <PixVoucher
            qrCodeImageUrl={payment.pix.qrCodeImageUrl}
            copyPaste={payment.pix.copyPaste}
            expiresAt={payment.pix.expiresAt}
            onCopied={() => toast.show(t("booking:reserve.pix.copiedToast"))}
          />
          <View className="flex-row items-center justify-center gap-2" testID="reserve-pix-waiting">
            <ActivityIndicator color={colors.primary} />
            <Text variant="muted" className="text-sm">
              {t("booking:reserve.pix.waiting")}
            </Text>
          </View>
        </View>
      ) : null}
    </ScreenContainer>
  );
}
