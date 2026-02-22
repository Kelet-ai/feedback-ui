// .storybook/YourTheme.ts
import { create } from "storybook/theming/create"

export default create({
  base: "light", // or 'dark'
  brandTitle: "Feedback UI",
  brandUrl: "https://github.com/kelet-ai/feedback-ui",
  // brandImage: './logo.svg',          // path from public/
  brandTarget: "_blank",
})
