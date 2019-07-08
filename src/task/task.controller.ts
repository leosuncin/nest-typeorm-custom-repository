import {
  Controller,
  Get,
  Query,
  Param,
  ParseIntPipe,
  Post,
  Body,
  Put,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskCreate } from './dto/task-create.dto';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  find(@Query() where?) {
    return this.taskService.findAll();
  }

  @Get('/done')
  listDone() {
    return this.taskService.findAllDone();
  }

  @Get('/pending')
  listPending() {
    return this.taskService.findAllPending();
  }

  @Get(':id(\\d+)')
  get(@Param('id', new ParseIntPipe()) id: number) {
    return this.taskService.get(id);
  }

  @Post()
  create(@Body() newTask: TaskCreate) {
    return this.taskService.create(newTask);
  }

  @Put(':id(\\d+)')
  update(@Param('id', new ParseIntPipe()) id: number, @Body() updates) {
    return this.taskService.update(id, updates);
  }

  @Patch(':id(\\d+)/done')
  markDone(@Param('id', new ParseIntPipe()) id: number) {
    return this.taskService.update(id, { done: true });
  }

  @Patch(':id(\\d+)/pending')
  markPending(@Param('id', new ParseIntPipe()) id: number) {
    return this.taskService.update(id, { done: false });
  }

  @Delete(':id(\\d+)')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', new ParseIntPipe()) id: number) {
    return this.taskService.remove(id);
  }
}
