"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const userController_1 = __importDefault(require("./src/controllers/userController"));
const adminController_1 = __importDefault(require("./src/controllers/adminController"));
const promptController_1 = __importDefault(require("./src/controllers/promptController"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT;
app.use(express_1.default.json());
// use cors package
app.use((0, cors_1.default)());
app.use("/user", userController_1.default);
app.use("/admin", adminController_1.default);
app.use("/prompt", promptController_1.default);
app.get("/", (req, res) => {
    res.send("PromptlyLabs api");
});
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
