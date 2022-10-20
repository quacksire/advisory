import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import {red} from "@nextui-org/react";
export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "School Loop",
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        // Add logic here to look up the user from the credentials supplied
        var res = await fetch("https://hmbhs.schoolloop.com/mapi/login?version=3&devToken=postman&devOS=postman&year=2022", {
          headers: {
            authorization: `Basic ${btoa(`${encodeURI(credentials.username)}:${encodeURI(credentials.password)}`)}`
          }
        })

        let user = await res.json()

        if (user) {
          // Any object returned will be saved in `user` property of the JWT
          return {
            fullName: user.fullName ,
            userID: user.userID ,
            role: user.role,
            email: user.email
          }
        } else {
          return null
          // If you return null then an error will be displayed advising the user to check their details.
          // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
        }
      }
    })
    // ...add more providers here
  ],
}
export default NextAuth(authOptions)
