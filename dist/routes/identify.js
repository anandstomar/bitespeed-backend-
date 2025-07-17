"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const identifyController_1 = require("../controllers/identifyController");
const router = (0, express_1.Router)();
router.post('/identify', identifyController_1.identifyController);
exports.default = router;
