import { PrismaClient } from '@prisma/client';
import { AuthUser } from '../../types';
import { CreateClassDto, UpdateClassDto } from './class.types';
type Db = Pick<PrismaClient, 'class'>;
export declare class ClassService {
    list(user: AuthUser, requestedSchoolId?: string, includeInactive?: boolean): Promise<({
        _count: {
            students: number;
        };
        feePackageClasses: ({
            feePackage: {
                name: string;
                id: string;
            };
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            classId: string;
            feePackageId: string;
        })[];
    } & {
        level: import(".prisma/client").$Enums.ClassLevel;
        name: string;
        id: string;
        schoolId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        sortOrder: number;
    })[]>;
    create(user: AuthUser, dto: CreateClassDto): Promise<{
        level: import(".prisma/client").$Enums.ClassLevel;
        name: string;
        id: string;
        schoolId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        sortOrder: number;
    }>;
    getById(user: AuthUser, id: string): Promise<{
        _count: {
            students: number;
        };
        feePackageClasses: ({
            feePackage: {
                name: string;
                id: string;
            };
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            classId: string;
            feePackageId: string;
        })[];
    } & {
        level: import(".prisma/client").$Enums.ClassLevel;
        name: string;
        id: string;
        schoolId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        sortOrder: number;
    }>;
    update(user: AuthUser, id: string, dto: UpdateClassDto): Promise<{
        level: import(".prisma/client").$Enums.ClassLevel;
        name: string;
        id: string;
        schoolId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        sortOrder: number;
    }>;
    setActive(user: AuthUser, id: string, isActive: boolean): Promise<{
        level: import(".prisma/client").$Enums.ClassLevel;
        name: string;
        id: string;
        schoolId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        sortOrder: number;
    }>;
    seedDefaultClasses(schoolId: string, db?: Db): Promise<void>;
}
export declare const classService: ClassService;
export {};
//# sourceMappingURL=class.service.d.ts.map