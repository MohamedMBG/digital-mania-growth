import { Controller, Get, Param, Query } from "@nestjs/common";
import { ListServicesQueryDto } from "./dto/list-services-query.dto";
import { ServicesService } from "./services.service";

@Controller("services")
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  listServices(@Query() query: ListServicesQueryDto) {
    return this.servicesService.listServices(query);
  }

  @Get("featured")
  listFeaturedServices(@Query() query: ListServicesQueryDto) {
    return this.servicesService.listFeaturedServices(query);
  }

  @Get(":slug")
  getServiceBySlug(@Param("slug") slug: string) {
    return this.servicesService.getServiceBySlug(slug);
  }
}
