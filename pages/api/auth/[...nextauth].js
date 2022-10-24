import NextAuth from "next-auth";
//import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
export const authOptions = {
  //process.env.PUBLIC_URL
  // Configure one or more authentication providers
  providers: [
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
        var res = await fetch(
          "https://hmbhs.schoolloop.com/mapi/login?version=3&devToken=postman&devOS=postman&year=2022",
          {
            headers: {
              authorization: `Basic ${btoa(
                `${encodeURI(credentials.username)}:${encodeURI(
                  credentials.password
                )}`
              )}`,
            },
          }
        );

        let user = await res.json();

        if (user) {
          // Any object returned will be saved in `user` property of the JWT
          return {
            fullName: user.fullName,
            userID: user.userID,
            role: user.role,
            email: user.email,
            auth: `Basic ${btoa(
              `${encodeURI(credentials.username)}:${encodeURI(
                credentials.password
              )}`
            )}`,
          };
        } else {
          return null;
          // If you return null then an error will be displayed advising the user to check their details.
          // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
        }
      },
    }),
    // ...add more providers here
  ],
  callbacks: {
    async signIn(user) {
      try {
        //the user object is wrapped in another user object so extract it
        user = user.user;
        console.log("Sign in callback", user);
        console.log("User id: ", user.userID);
        if (typeof user.userID !== typeof undefined) {
          console.log("User is active");
          return user;
        } else {
          console.log("User id was undefined");
          return false;
        }
      } catch (err) {
        console.error("Signin callback error:", err);
      }
    },
    async jwt(token, user) {
      //console.log("token: ", user);
      if (user?.role) {
        token.user.role = user.role;
      }
      if (user?.userID) {
        token.user.userID = user.userID;
      }
      if (user?.fullName) {
        token.user.fullName = user.fullName;
      }
      if (user?.email) {
        token.user.email = user.email;
      }
      if (user?.auth) {
        token.user.auth = user.auth;
      }

      return token;
    },
    async session({ session, token, user }) {
      //console.log("token -", token.token);
      token = token.token;
      // Send properties to the client, like an access_token and user id from a provider.
      session.user.role = token.user.role;

      session.user.userID = token.user.userID;
      session.user.fullName = token.user.fullName;
      session.user.email = token.user.email;
      session.user.auth = token.user.auth;

      return session;
    },
  },

  theme: {
    colorScheme: "dark", // "auto" | "dark" | "light"
    brandColor: "#ff6f00", // Hex color code
    logo: "", // Absolute URL to image
    buttonText: "", // Hex color code
  },
};
export default NextAuth(authOptions);
