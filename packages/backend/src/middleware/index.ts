export {
  contextMiddleware,
  getAppContext,
  createAppContext,
  hasAppContext,
  type AppContext,
} from "./context.middleware";

// Re-export auth middleware for convenience
export { authMiddleware } from "../features/auth/auth.middleware";
