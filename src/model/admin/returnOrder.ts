export interface ReturnRequestListResponse {
  userName: string;
   code: string;
  note: string;
  requestDate: Date;
  totalProduct:number
  thumbnailUrl:string;
}
export interface ReturnRequestItemResponse{
  id:number
  productName:string
  imageProduct:string
  quantity:number
  reason:string
  note:string
  status:string
  unitPrice:number
  totalRefundAmount:number
  attributes: { [key: string]: string }; 
  returnMediaAdminResponses:ReturnMediaAdminResponse[]
}
export interface ReturnMediaAdminResponse{
  returnRequestItem:number
  url:string
  type:string
}
export interface ReturnRequestListRequest{
adminNote:string
}