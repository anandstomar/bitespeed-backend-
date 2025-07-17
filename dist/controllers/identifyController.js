"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.identifyController = void 0;
const contactService_1 = require("../services/contactService");
const identifyController = async (req, res) => {
    try {
        const { email, phoneNumber } = req.body;
        const result = await (0, contactService_1.handleIdentify)({ email, phoneNumber });
        res.status(200).json({ contact: result });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.identifyController = identifyController;
