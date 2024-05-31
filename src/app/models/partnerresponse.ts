export class IPartnerResponse {
    partnername?: string;
    partnerrequest?: string;
    _id: string;
    date?:Date;
    response?:string;
    createdOn?: Date;
    createdBy?: number;
    lastModifiedOn?: string;
    status?: number;

  }
export class IChatBotConversationResponse {
    name?: string;
    city?: string;
    email?: string;
    _id: string;
    request?:string;
    response?:string;
    createdOn?: Date;
    tokenType?:number
    displayCategory: string;
    category: number;
    displayType: string;

  }
