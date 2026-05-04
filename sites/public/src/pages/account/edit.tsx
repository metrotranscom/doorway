import React, { useContext } from "react"
import { AuthContext } from "@bloom-housing/shared-helpers"
import { EditPublicAccount } from "../../components/account/EditPublicAccount"
import { EditAdvocateAccount } from "../../components/account/EditAdvocateAccount"

const Edit = () => {
  const { profile } = useContext(AuthContext)
  return profile?.isAdvocate ? <EditAdvocateAccount agencies={[]} /> : <EditPublicAccount />
}

export default Edit

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// export async function getServerSideProps(context: { req: any; query: any }) {
//   const jurisdiction = await fetchJurisdictionByName(context.req)
//   const agencies = await fetchAgencies(context.req, jurisdiction?.id)

//   return {
//     props: { jurisdiction, agencies: agencies?.items || [] },
//   }
// }
