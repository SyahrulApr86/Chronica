"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarsModule = void 0;
const common_1 = require("@nestjs/common");
const calendars_controller_1 = require("./calendars.controller");
const calendars_service_1 = require("./calendars.service");
const prisma_service_1 = require("../prisma.service");
let CalendarsModule = class CalendarsModule {
};
exports.CalendarsModule = CalendarsModule;
exports.CalendarsModule = CalendarsModule = __decorate([
    (0, common_1.Module)({
        controllers: [calendars_controller_1.CalendarsController],
        providers: [calendars_service_1.CalendarsService, prisma_service_1.PrismaService],
        exports: [calendars_service_1.CalendarsService],
    })
], CalendarsModule);
//# sourceMappingURL=calendars.module.js.map