import { createApp } from "./app.js";
import { AuthModel } from "./models/auth.js";
import { AdminModel } from "./models/admin.js";

createApp({ authModel: AuthModel, adminModel: AdminModel});