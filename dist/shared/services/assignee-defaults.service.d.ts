import { Repository } from 'typeorm';
import { UserEntity } from '../../entities/user.entity';
export declare class AssigneeDefaultsService {
    private userRepo;
    constructor(userRepo: Repository<UserEntity>);
    getAdminUserIds(): Promise<number[]>;
    mergeResourceAssignees(dtoAssigneeIds: number[] | undefined, creatorId: number | undefined): Promise<number[]>;
    resolveTaskAssigneeIds(dtoAssigneeIds: number[] | undefined, creatorId: number | undefined): number[];
}
