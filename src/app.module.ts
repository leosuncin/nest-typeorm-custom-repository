import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { options } from './data-source';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TaskModule } from './task/task.module';

@Module({
  imports: [TypeOrmModule.forRoot(options), TaskModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
