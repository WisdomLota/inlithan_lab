const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL,
    scope: ["user:email", "read:user", "repo"],
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ githubId: profile.id });

      if (!user) {
        const email = profile.emails?.[0]?.value || `${profile.username}@github.com`;
        user = await User.findOne({ email });

        if (user) {
          // Existing account (e.g. signed up with Google) — link GitHub to it
          user.githubId = profile.id;
          user.githubUsername = profile.username;
          user.githubAccessToken = accessToken;
          await user.save();
        } else {
          user = await User.create({
            name: profile.displayName || profile.username,
            email,
            avatar: profile.photos?.[0]?.value,
            githubId: profile.id,
            githubUsername: profile.username,
            githubAccessToken: accessToken,
          });
        }
      } else {
        user.githubAccessToken = accessToken;
        await user.save();
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
    
      if (!user) {
        const email = profile.emails?.[0]?.value;
        user = await User.findOne({ email });
      
        if (user) {
          // Existing account (e.g. signed up with GitHub) — link Google to it
          user.googleId = profile.id;
          if (!user.avatar) user.avatar = profile.photos?.[0]?.value;
          await user.save();
        } else {
          user = await User.create({
            name: profile.displayName,
            email,
            avatar: profile.photos?.[0]?.value,
            googleId: profile.id,
          });
        }
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

module.exports = passport;