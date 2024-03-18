import React, { useState } from "react"
import { Field, Form, t } from "@bloom-housing/ui-components"
import { Button, Heading } from "@bloom-housing/ui-seeds"
import Markdown from "markdown-to-jsx"
import { useForm } from "react-hook-form"
import { BloomCard } from "../../../../shared-helpers/src/views/components/BloomCard"
import { CardSection, CardFooter } from "@bloom-housing/ui-seeds/src/blocks/Card"
import styles from "../../../../shared-helpers/src/views/terms/form-terms.module.scss"
import FormsLayout from "../layouts/forms"
import { useRouter } from "next/router"

const Terms = () => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { handleSubmit, register, errors } = useForm()
  const [notChecked, setChecked] = useState(true)
  const router = useRouter()
  const onSubmit = () => router.push("/account/dashboard")

  return (
    <FormsLayout>
      <Form id="terms" onSubmit={handleSubmit(onSubmit)}>
        <BloomCard
          customIcon="profile"
          title={t("authentication.terms.reviewToc")}
          headingPriority={1}
        >
          <>
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
    </FormsLayout>
  )
}

export { Terms as default, Terms }
