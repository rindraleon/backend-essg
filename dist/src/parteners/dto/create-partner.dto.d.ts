export declare class CreatePartenaireDto {
    nom: string;
    type: 'Entreprise' | 'Institution' | 'Organisation' | 'Autre';
    secteur?: string;
    description: string;
    siteWeb?: string;
    logo?: string;
    contact?: string;
    dateDebut: string;
}
declare const UpdatePartenaireDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreatePartenaireDto>>;
export declare class UpdatePartenaireDto extends UpdatePartenaireDto_base {
}
export {};
