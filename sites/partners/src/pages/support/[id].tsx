import React, { useContext, useState } from "react"
import Head from "next/head"
import { useRouter } from "next/router"
import dayjs from "dayjs"
import { t, AlertBox, Breadcrumbs, BreadcrumbLink } from "@bloom-housing/ui-components"
import { AuthContext, MessageContext } from "@bloom-housing/shared-helpers"
import { Button, Card, Heading, Icon } from "@bloom-housing/ui-seeds"
import DocumentDuplicateIcon from "@heroicons/react/24/solid/DocumentDuplicateIcon"
import SupportLayout from "../../layouts/SupportLayout"
import useSWR from "swr"
import { getSupportTabs } from "../../lib/helpers"

const SupportUserDetail = () => {
  const { profile, userService } = useContext(AuthContext)
  const { addToast } = useContext(MessageContext)
  const router = useRouter()
  const [errorAlert, setErrorAlert] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  const userId = router.query.id as string
  const COOLDOWN_KEY = `reset_cooldown_${userId}`

  // Fetch the user using standard SWR pattern
  const fetcher = () => userService.retrieve({ id: userId })
  const { data: user, error } = useSWR(userId ? `/api/adapter/user/${userId}` : null, fetcher)

  // Initialize cooldown from localStorage on mount
  React.useEffect(() => {
    if (userId) {
      const expiry = localStorage.getItem(COOLDOWN_KEY)
      if (expiry) {
        const remaining = Math.ceil((parseInt(expiry) - Date.now()) / 1000)
        if (remaining > 0) setCooldown(remaining)
      }
    }
  }, [userId, COOLDOWN_KEY])

  // Countdown timer
  React.useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      localStorage.removeItem(COOLDOWN_KEY)
    }
  }, [cooldown, COOLDOWN_KEY])

  if (error) return <div>{t("t.errorOccurred")}</div>

  const handlePasswordReset = async () => {
    setSubmitLoading(true)
    setErrorAlert(false)
    try {
      const publicUrl = user?.jurisdictions?.[0]?.publicUrl || window.location.origin
      await userService.forgotPassword({
        body: {
          email: user.email,
          appUrl: publicUrl,
        },
      })

      // Set 60 second cooldown
      const duration = 60
      setCooldown(duration)
      localStorage.setItem(COOLDOWN_KEY, (Date.now() + duration * 1000).toString())

      addToast(
        t("authentication.forgotPassword.message", {
          defaultValue: "If an account exists for this email, a password reset link will be sent.",
        }),
        { variant: "success" }
      )
    } catch (err) {
      console.error(err)
      setErrorAlert(true)
    } finally {
      setSubmitLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    void navigator.clipboard.writeText(text)
    addToast(t("t.copySuccess", { defaultValue: "Copied to clipboard" }), { variant: "success" })
  }

  return (
    <SupportLayout user={user} userId={userId}>
      {errorAlert && (
        <AlertBox
          className="mb-8"
          onClose={() => setErrorAlert(false)}
          closeable
          type="alert"
          inverted
        >
          {t("account.settings.alerts.genericError")}
        </AlertBox>
      )}

      {!user ? (
        <div className="flex justify-center p-8">{t("t.loading")}</div>
      ) : (
        <div className="flex flex-row gap-8">
          <div className="md:w-9/12 flex flex-col gap-8">
            <Card>
              <Card.Header>
                <Heading size="2xl" priority={2}>
                  {t("users.accountDetails")}
                </Heading>
              </Card.Header>
              <Card.Section>
                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                  <div>
                    <div className="text-sm text-gray-500 uppercase tracking-wider mb-1">
                      {t("t.firstName")}
                    </div>
                    <div className="font-medium text-lg">{user.firstName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 uppercase tracking-wider mb-1">
                      {t("t.lastName")}
                    </div>
                    <div className="font-medium text-lg">{user.lastName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 uppercase tracking-wider mb-1">
                      {t("t.email")}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-lg">{user.email}</span>
                      <button
                        className="text-gray-400 hover:text-primary transition-colors flex items-center justify-center p-1 rounded-md hover:bg-gray-100"
                        onClick={() => copyToClipboard(user.email)}
                        aria-label={`Copy email: ${user.email}`}
                        title={t("t.copy", { defaultValue: "Copy" })}
                        style={{ background: "transparent", border: "none", cursor: "pointer" }}
                      >
                        <Icon size="sm">
                          <DocumentDuplicateIcon />
                        </Icon>
                      </button>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 uppercase tracking-wider mb-1">
                      {t("t.language")}
                    </div>
                    <div className="font-medium text-lg">
                      {user.language || t("t.notSpecified")}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 uppercase tracking-wider mb-1">
                      {t("listings.details.createdDate")}
                    </div>
                    <div className="font-medium text-lg">
                      {dayjs(user.createdAt).format("MMMM DD, YYYY")}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 uppercase tracking-wider mb-1">
                      {t("t.status")}
                    </div>
                    <div className="font-medium text-lg">
                      {user.confirmedAt ? t("users.confirmed") : t("users.unconfirmed")}
                    </div>
                  </div>
                </div>
              </Card.Section>
            </Card>
          </div>

          <aside className="md:w-3/12 flex flex-col gap-4">
            <Button
              variant="primary"
              className="w-full justify-center"
              onClick={() => {
                void handlePasswordReset()
              }}
              loadingMessage={submitLoading ? t("t.loading") : undefined}
              disabled={cooldown > 0 || submitLoading}
              id="reset-password-btn"
            >
              {cooldown > 0
                ? `${t("users.resetPassword")} (${cooldown}s)`
                : t("users.resetPassword")}
            </Button>
            {user.updatedAt && (
              <div className="text-sm text-gray-500 mt-4 text-center">
                {t("listings.details.editedAt")} <br />
                {dayjs(user.updatedAt).format("MMMM DD, YYYY, hh:mm A")}
              </div>
            )}
          </aside>
        </div>
      )}
    </SupportLayout>
  )
}

export default SupportUserDetail
