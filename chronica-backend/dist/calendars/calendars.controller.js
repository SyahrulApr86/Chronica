"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const calendars_service_1 = require("./calendars.service");
const calendar_dto_1 = require("./dto/calendar.dto");
let CalendarsController = class CalendarsController {
    calendarsService;
    constructor(calendarsService) {
        this.calendarsService = calendarsService;
    }
    async createCalendar(req, createCalendarDto) {
        return this.calendarsService.createCalendar(req.user.id, createCalendarDto);
    }
    async getUserCalendars(req) {
        return this.calendarsService.getUserCalendars(req.user.id);
    }
    async getDefaultCalendar(req) {
        return this.calendarsService.getDefaultCalendar(req.user.id);
    }
    async getCalendarById(req, id) {
        return this.calendarsService.getCalendarById(id, req.user.id);
    }
    async updateCalendar(req, id, updateCalendarDto) {
        return this.calendarsService.updateCalendar(id, req.user.id, updateCalendarDto);
    }
    async deleteCalendar(req, id) {
        return this.calendarsService.deleteCalendar(id, req.user.id);
    }
};
exports.CalendarsController = CalendarsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, calendar_dto_1.CreateCalendarDto]),
    __metadata("design:returntype", Promise)
], CalendarsController.prototype, "createCalendar", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CalendarsController.prototype, "getUserCalendars", null);
__decorate([
    (0, common_1.Get)('default'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CalendarsController.prototype, "getDefaultCalendar", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CalendarsController.prototype, "getCalendarById", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, calendar_dto_1.UpdateCalendarDto]),
    __metadata("design:returntype", Promise)
], CalendarsController.prototype, "updateCalendar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CalendarsController.prototype, "deleteCalendar", null);
exports.CalendarsController = CalendarsController = __decorate([
    (0, common_1.Controller)('calendars'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [calendars_service_1.CalendarsService])
], CalendarsController);
//# sourceMappingURL=calendars.controller.js.map