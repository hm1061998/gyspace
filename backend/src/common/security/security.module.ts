import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IpBlockEntity } from './ip-block.entity';
import { SecurityService } from './security.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([IpBlockEntity])],
  providers: [SecurityService],
  exports: [SecurityService],
})
export class SecurityModule {}
