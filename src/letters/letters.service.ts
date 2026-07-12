import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLetterDto } from './dto/create-letter.dto';
import { UpdateLetterDto } from './dto/update-letter.dto';
import { Letter } from './letter.types';

@Injectable()
export class LettersService {
  private readonly letters = new Map<string, Letter>();

  constructor() {
    const now = new Date().toISOString();
    const samples: Letter[] = [
      {
        id: 'letter-2027', title: 'Gửi mình của tuổi 25', content: '',
        recipientName: 'Minh Anh', recipientEmail: 'minhanh@example.com',
        address: '12 Nguyễn Văn Bảo, Gò Vấp, TP.HCM', deliveryDate: '2027-07-11',
        deliveryMethod: 'hybrid', letterType: 'online', paper: 'Ivory', font: 'Editorial',
        envelope: 'Burgundy', status: 'stored', sealedAt: '2026-07-11T08:00:00.000Z',
        createdAt: now, updatedAt: now, trackingCode: 'PD-270711-MA',
      },
      {
        id: 'letter-2026', title: 'Ngày mình tốt nghiệp', content: '',
        recipientName: 'Minh Anh', recipientEmail: 'minhanh@example.com',
        deliveryDate: '2026-08-20', deliveryMethod: 'email', letterType: 'online',
        paper: 'Warm', font: 'Modern', envelope: 'Ivory', status: 'scheduled',
        sealedAt: '2026-05-20T08:00:00.000Z', createdAt: now, updatedAt: now,
      },
    ];
    samples.forEach((letter) => this.letters.set(letter.id, letter));
  }

  findAll() {
    return [...this.letters.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  findOne(id: string) {
    const letter = this.letters.get(id);
    if (!letter) throw new NotFoundException('Không tìm thấy lá thư');
    return letter;
  }

  create(dto: CreateLetterDto) {
    const timestamp = new Date().toISOString();
    const id = `letter-${Date.now()}`;
    const letter: Letter = {
      ...dto,
      id,
      paper: dto.paper ?? 'Ivory',
      font: dto.font ?? 'Editorial',
      envelope: dto.envelope ?? 'Burgundy',
      status: 'draft',
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    this.letters.set(id, letter);
    return letter;
  }

  update(id: string, dto: UpdateLetterDto) {
    const current = this.findOne(id);
    if (current.sealedAt) return current;
    const updated = { ...current, ...dto, updatedAt: new Date().toISOString() };
    this.letters.set(id, updated);
    return updated;
  }

  seal(id: string) {
    const current = this.findOne(id);
    const now = new Date().toISOString();
    const sealed: Letter = { ...current, status: 'stored', sealedAt: now, updatedAt: now, content: '' };
    this.letters.set(id, sealed);
    return sealed;
  }

  dashboard() {
    const letters = this.findAll();
    return {
      summary: {
        stored: letters.filter((item) => item.status === 'stored').length,
        upcoming: letters.filter((item) => ['scheduled', 'in_transit'].includes(item.status)).length,
        confirmation: letters.filter((item) => item.status === 'address_confirmation').length,
        delivered: letters.filter((item) => item.status === 'delivered').length,
      },
      letters,
    };
  }
}
