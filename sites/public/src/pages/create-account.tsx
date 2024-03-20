import React, { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import {
  Field,
  Form,
  emailRegex,
  t,
  DOBField,
  SiteAlert,
  passwordRegex,
} from "@bloom-housing/ui-components"
import { Button, Heading } from "@bloom-housing/ui-seeds"
import { CardSection } from "@bloom-housing/ui-seeds/src/blocks/Card"
import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"
dayjs.extend(customParseFormat)
import { useRouter } from "next/router"
import { PageView, pushGtmEvent, BloomCard } from "@bloom-housing/shared-helpers"
import { UserStatus } from "../lib/constants"
import FormsLayout from "../layouts/forms"
import BloomCardStyles from "./account/account.module.scss"
import styles from "../../styles/create-account.module.scss"
import signUpBenefitsStyles from "../../styles/sign-up-benefits.module.scss"
import SignUpBenefits from "../components/account/SignUpBenefits"
import SignUpBenefitsHeadingGroup from "../components/account/SignUpBenefitsHeadingGroup"

export default () => {
  const signUpCopy = process.env.showMandatedAccounts
  /* Form Handler */
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, handleSubmit, errors, watch } = useForm()
  const router = useRouter()
  const email = useRef({})
  const password = useRef({})
  email.current = watch("email", "")
  password.current = watch("password", "")

  useEffect(() => {
    pushGtmEvent<PageView>({
      event: "pageView",
      pageTitle: "Create Account",
      status: UserStatus.NotLoggedIn,
    })
  }, [])

  const onSubmit = (data) => {
    void router.push({ pathname: "/terms", query: data })
  }

  return (
    <FormsLayout className={signUpCopy && "sm:max-w-lg md:max-w-full"}>
      <div className={signUpCopy && signUpBenefitsStyles["benefits-container"]}>
        {signUpCopy && (
          <div className={signUpBenefitsStyles["benefits-display-hide"]}>
            <SignUpBenefitsHeadingGroup mobileView={true} />
          </div>
        )}
        <div className={signUpCopy && signUpBenefitsStyles["benefits-form-container"]}>
          <BloomCard customIcon="profile" title={t("account.createAccount")} headingPriority={1}>
            <>
              <SiteAlert type="notice" dismissable />
              <Form id="create-account" onSubmit={handleSubmit(onSubmit)}>
                <CardSection
                  divider={"inset"}
                  className={BloomCardStyles["account-card-settings-section"]}
                >
                  <label className={styles["create-account-header"]} htmlFor="firstName">
                    {t("application.name.yourName")}
                  </label>

                  <label className={styles["create-account-field"]} htmlFor="firstName">
                    {t("application.name.firstName")}
                  </label>
                  <Field
                    controlClassName={styles["create-account-input"]}
                    name="firstName"
                    validation={{ required: true, maxLength: 64 }}
                    error={errors.givenName}
                    errorMessage={
                      errors.givenName?.type === "maxLength"
                        ? t("errors.maxLength")
                        : t("errors.firstNameError")
                    }
                    register={register}
                  />

                  <label className={styles["create-account-field"]} htmlFor="middleName">
                    {t("application.name.middleNameOptional")}
                  </label>
                  <Field
                    name="middleName"
                    register={register}
                    label={t("application.name.middleNameOptional")}
                    readerOnly
                    error={errors.middleName}
                    validation={{ maxLength: 64 }}
                    errorMessage={t("errors.maxLength")}
                    controlClassName={styles["create-account-input"]}
                  />

                  <label className={styles["create-account-field"]} htmlFor="lastName">
                    {t("application.name.lastName")}
                  </label>
                  <Field
                    name="lastName"
                    validation={{ required: true, maxLength: 64 }}
                    error={errors.lastName}
                    register={register}
                    label={t("application.name.lastName")}
                    errorMessage={
                      errors.lastName?.type === "maxLength"
                        ? t("errors.maxLength")
                        : t("errors.lastNameError")
                    }
                    readerOnly
                    controlClassName={styles["create-account-input"]}
                  />
                </CardSection>
                <CardSection
                  divider={"inset"}
                  className={BloomCardStyles["account-card-settings-section"]}
                >
                  <DOBField
                    register={register}
                    required={true}
                    error={errors.dob}
                    name="dob"
                    id="dob"
                    watch={watch}
                    validateAge18={true}
                    errorMessage={t("errors.dateOfBirthErrorAge")}
                    label={t("application.name.yourDateOfBirth")}
                  />
                  <p className={"field-sub-note"}>{t("application.name.dobHelper")}</p>
                </CardSection>

                <CardSection
                  divider={"inset"}
                  className={BloomCardStyles["account-card-settings-section"]}
                >
                  <Field
                    type="email"
                    name="email"
                    label={t("application.name.yourEmailAddress")}
                    validation={{ required: true, pattern: emailRegex }}
                    error={errors.email}
                    errorMessage={t("authentication.signIn.loginError")}
                    register={register}
                    controlClassName={styles["create-account-input"]}
                    labelClassName={"text__caps-spaced"}
                  />
                </CardSection>
                <CardSection
                  divider={"inset"}
                  className={BloomCardStyles["account-card-settings-section"]}
                >
                  <Field
                    labelClassName={"text__caps-spaced"}
                    type={"password"}
                    name="password"
                    note={t("authentication.createAccount.passwordInfo")}
                    label={t("authentication.createAccount.password")}
                    validation={{
                      required: true,
                      minLength: 8,
                      pattern: passwordRegex,
                    }}
                    error={errors.password}
                    errorMessage={t("authentication.signIn.passwordError")}
                    register={register}
                    controlClassName={styles["create-account-input"]}
                  />
                  <label className={styles["create-account-field"]} htmlFor="passwordConfirmation">
                    {t("authentication.createAccount.reEnterPassword")}
                  </label>
                  <Field
                    type="password"
                    name="passwordConfirmation"
                    validation={{
                      validate: (value) =>
                        value === password.current ||
                        t("authentication.createAccount.errors.passwordMismatch"),
                    }}
                    onPaste={(e) => {
                      e.preventDefault()
                      e.nativeEvent.stopImmediatePropagation()
                      return false
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      e.nativeEvent.stopImmediatePropagation()
                      return false
                    }}
                    error={errors.passwordConfirmation}
                    errorMessage={t("authentication.createAccount.errors.passwordMismatch")}
                    register={register}
                    controlClassName={styles["create-account-input"]}
                    label={t("authentication.createAccount.reEnterPassword")}
                    readerOnly
                  />
                  <Button type="submit" variant="primary">
                    {t("account.createAccount")}
                  </Button>
                </CardSection>
                <CardSection
                  divider={"inset"}
                  className={BloomCardStyles["account-card-settings-section"]}
                >
                  <Heading priority={2} size="2xl" className="mb-6">
                    {t("account.haveAnAccount")}
                  </Heading>
                  <Button href="/sign-in" variant="primary-outlined">
                    {t("nav.signIn")}
                  </Button>
                </CardSection>
              </Form>
            </>
          </BloomCard>
        </div>
        {signUpCopy && (
          <div className={signUpBenefitsStyles["benefits-hide-display"]}>
            <div className={signUpBenefitsStyles["benefits-desktop-container"]}>
              <SignUpBenefitsHeadingGroup mobileView={false} />
              <SignUpBenefits idTag="desktop" />
            </div>
          </div>
        )}
        {signUpCopy && (
          <div className={signUpBenefitsStyles["benefits-display-hide"]}>
            <SignUpBenefits idTag="mobile" />
          </div>
        )}
      </div>
    </FormsLayout>
  )
}
