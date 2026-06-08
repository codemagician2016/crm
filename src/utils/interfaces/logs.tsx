
export interface ILog {
    _id: string;
    leadId: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    createdById: string;
    field?: string;
    newValue?: string;
    previousValue?: string;
    type: 'new' | 'update';
  }