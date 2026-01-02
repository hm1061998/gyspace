import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { IpBlockEntity } from './ip-block.entity';

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);

  constructor(
    @InjectRepository(IpBlockEntity)
    private ipBlockRepository: Repository<IpBlockEntity>,
  ) {}

  async isIpBlocked(ip: string): Promise<boolean> {
    const block = await this.ipBlockRepository.findOne({
      where: {
        ip,
        blockedUntil: MoreThan(new Date()),
      },
    });
    return !!block;
  }

  async blockIp(ip: string, durationMinutes: number, reason: string) {
    const blockedUntil = new Date();
    blockedUntil.setMinutes(blockedUntil.getMinutes() + durationMinutes);

    let block = await this.ipBlockRepository.findOne({ where: { ip } });

    if (block) {
      block.blockedUntil = blockedUntil;
      block.reason = reason;
      block.violationCount += 1;
    } else {
      block = this.ipBlockRepository.create({
        ip,
        blockedUntil,
        reason,
        violationCount: 1,
      });
    }

    await this.ipBlockRepository.save(block);
    this.logger.warn(
      `IP ${ip} blocked until ${blockedUntil} for reason: ${reason}`,
    );
  }

  async recordViolation(ip: string) {
    // Logic to decide when to block
    // For now, if they hit rate limit, we can block them for 15 mins
    await this.blockIp(ip, 15, 'Throttler limit exceeded');
  }
}
