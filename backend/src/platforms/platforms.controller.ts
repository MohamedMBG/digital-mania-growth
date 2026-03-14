import { Controller, Get } from "@nestjs/common";
import { PlatformsService } from "./platforms.service";

@Controller("platforms")
export class PlatformsController {
  constructor(private readonly platformsService: PlatformsService) {}

  @Get()
  listPlatforms() {
    return this.platformsService.listPlatforms();
  }
}
