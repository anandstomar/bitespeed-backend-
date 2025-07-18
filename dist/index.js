"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const identify_1 = __importDefault(require("./routes/identify"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use('/api', identify_1.default);
app.get('/', (req, res) => {
    res.send('Hello, backend is running !');
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
