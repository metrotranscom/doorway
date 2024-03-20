import React, { useState, useContext } from "react"
import { Field, Form, t, AlertBox, Modal } from "@bloom-housing/ui-components"
import { Button, Heading } from "@bloom-housing/ui-seeds"
import Markdown from "markdown-to-jsx"
import { useForm } from "react-hook-form"
import { BloomCard } from "../../../../shared-helpers/src/views/components/BloomCard"
import { CardSection, CardFooter } from "@bloom-housing/ui-seeds/src/blocks/Card"
import styles from "../../../../shared-helpers/src/views/terms/form-terms.module.scss"
import FormsLayout from "../layouts/forms"
import { AuthContext } from "@bloom-housing/shared-helpers"
import { useRouter } from "next/router"
import dayjs from "dayjs"

const Terms = () => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { handleSubmit, register, errors } = useForm()
  const router = useRouter()
  const language = router.locale
  const { createUser, resendConfirmation } = useContext(AuthContext)
  const [notChecked, setChecked] = useState(true)
  const [requestError, setRequestError] = useState<string>()
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [confirmationResent, setConfirmationResent] = useState<boolean>(false)
  const listingId = router.query?.listingId as string

  const onSubmit = async () => {
    console.log("router.query", router.query)
    try {
      const { dob, ...rest } = router.query
      const listingIdRedirect =
        process.env.showMandatedAccounts && listingId ? listingId : undefined
      await createUser(
        {
          ...rest,
          dob: dayjs(`${dob.birthYear}-${dob.birthMonth}-${dob.birthDay}`),
          language,
        },
        listingIdRedirect
      )

      setOpenModal(true)
    } catch (err) {
      const { status, data } = err.response || {}
      if (status === 400) {
        setRequestError(`${t(`authentication.createAccount.errors.${data.message}`)}`)
      } else if (status === 409) {
        console.error(err)
        setRequestError(`${t("authentication.createAccount.errors.emailInUse")}`)
      } else {
        console.error(err)
        setRequestError(`${t("authentication.createAccount.errors.generic")}`)
      }
      window.scrollTo(0, 0)
    }
  }

  return (
    <FormsLayout>
      <Form id="terms" onSubmit={handleSubmit(onSubmit)}>
        <BloomCard
          customIcon="profile"
          title={t("authentication.terms.reviewToc")}
          headingPriority={1}
        >
          <>
            {requestError && (
              <AlertBox className="" onClose={() => setRequestError(undefined)} type="alert">
                {requestError}
              </AlertBox>
            )}
            <CardSection className={styles["form-terms"]}>
              <p>{t("authentication.terms.publicAccept")}</p>
              <Heading size="lg" priority={2}>
                {t("authentication.terms.termsOfUse")}
              </Heading>
              <Markdown>{t("authentication.terms.publicTerms")}</Markdown>
            </CardSection>
            <CardSection className={styles["form-accept"]}>
              <Field
                id="agree"
                name="agree"
                type="checkbox"
                label={t(`authentication.terms.acceptExtended`)}
                register={register}
                validation={{ required: true }}
                error={!!errors.agree}
                errorMessage={t("errors.agreeError")}
                dataTestId="agree"
                onChange={() => setChecked(!notChecked)}
              />
            </CardSection>
            <CardFooter className={styles["form-submit-public"]}>
              <Button disabled={notChecked} type="submit" variant="primary" id="form-submit">
                {t("t.finish")}
              </Button>
            </CardFooter>
          </>
        </BloomCard>
      </Form>
      <Modal
        open={openModal}
        title={t("authentication.createAccount.confirmationNeeded")}
        ariaDescription={t("authentication.createAccount.anEmailHasBeenSent", {
          email: router.query.email,
        })}
        onClose={() => {
          void router.push("/sign-in")
          window.scrollTo(0, 0)
        }}
        actions={[
          <Button
            variant="primary"
            onClick={() => {
              void router.push("/sign-in")
              window.scrollTo(0, 0)
            }}
            size="sm"
          >
            {t("t.ok")}
          </Button>,
          <Button
            variant="primary-outlined"
            disabled={confirmationResent}
            onClick={() => {
              setConfirmationResent(true)
              void resendConfirmation(router.query.email.toString(), listingId)
            }}
            size="sm"
          >
            {t("authentication.createAccount.resendTheEmail")}
          </Button>,
        ]}
      >
        <>
          <p>
            {t("authentication.createAccount.anEmailHasBeenSent", { email: router.query.email })}
          </p>
          <p>{t("authentication.createAccount.confirmationInstruction")}</p>
        </>
      </Modal>
    </FormsLayout>
  )
}

export { Terms as default, Terms }
