import { IStudentIntentRepository } from '../../domain/IStudentIntentRepository';
import { CatalogModule } from '../../../../shared/catalog';
import { IntentRequestDto, IntentResponseDto } from '../dtos';
import { AppError } from '../../../../shared/errors';

export class StudentIntentUseCases {
  constructor(private readonly intentRepository: IStudentIntentRepository) {}

  async getCurrentIntent(studentId: string): Promise<IntentResponseDto | null> {
    const intent = await this.intentRepository.getCurrentIntent(studentId);
    if (!intent) return null;
    return this.mapToDto(intent);
  }

  async submitInitialIntent(studentId: string, dto: IntentRequestDto): Promise<IntentResponseDto> {
    await this.validateIntentRequest(dto);
    
    const intent = await this.intentRepository.submitInitialIntent(studentId, {
      pathwayCode: dto.pathwayCode,
      programCode: dto.programCode,
      preferredLocationId: dto.preferredLocationId,
      requiresHostel: dto.requiresHostel,
      maxAnnualFee: dto.maxAnnualFee,
    });
    
    return this.mapToDto(intent);
  }

  async reviseIntent(studentId: string, dto: IntentRequestDto): Promise<IntentResponseDto> {
    await this.validateIntentRequest(dto);
    
    const intent = await this.intentRepository.reviseIntent(studentId, {
      pathwayCode: dto.pathwayCode,
      programCode: dto.programCode,
      preferredLocationId: dto.preferredLocationId,
      requiresHostel: dto.requiresHostel,
      maxAnnualFee: dto.maxAnnualFee,
    });
    
    return this.mapToDto(intent);
  }

  private async validateIntentRequest(dto: IntentRequestDto) {
    // Validate Pathway
    const isPathwayValid = await CatalogModule.validatePathway(dto.pathwayCode);
    if (!isPathwayValid) {
      throw new AppError(`Invalid or inactive pathway code: ${dto.pathwayCode}`, 400, 'BAD_REQUEST');
    }

    // Validate Program if provided
    if (dto.programCode) {
      const isProgramValid = await CatalogModule.validateProgram(dto.pathwayCode, dto.programCode);
      if (!isProgramValid) {
        throw new AppError(`Invalid or inactive program code: ${dto.programCode} for pathway ${dto.pathwayCode}`, 400, 'BAD_REQUEST');
      }
    }

    // Validate Area if provided
    if (dto.preferredLocationId) {
      const isAreaValid = await CatalogModule.validateArea(dto.preferredLocationId);
      if (!isAreaValid) {
        throw new AppError(`Invalid or inactive service area ID: ${dto.preferredLocationId}`, 400, 'BAD_REQUEST');
      }
    }

    // Validate Fee
    if (dto.maxAnnualFee !== null && dto.maxAnnualFee < 0) {
      throw new AppError('Max annual fee must be non-negative', 400, 'BAD_REQUEST');
    }
  }

  private mapToDto(intent: any): IntentResponseDto {
    return {
      id: intent.props.id,
      versionNumber: intent.props.versionNumber,
      pathwayCode: intent.props.pathwayCode,
      programCode: intent.props.programCode,
      preferredLocationId: intent.props.preferredLocationId,
      requiresHostel: intent.props.requiresHostel,
      maxAnnualFee: intent.props.maxAnnualFee,
      status: intent.props.status,
      remainingChanges: intent.remainingChanges,
    };
  }
}
