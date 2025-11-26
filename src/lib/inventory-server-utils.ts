import dbConnect from './mongodb';
import InventoryLog from '../models/InventoryLog';

export async function createInventoryLog(
  medicineId: string,
  type: 'sale' | 'purchase' | 'adjustment' | 'expired' | 'damaged',
  quantity: number,
  previousQuantity: number,
  newQuantity: number,
  reference: string,
  options: {
    unitPrice?: number;
    totalAmount?: number;
    notes?: string;
    batchNumber?: string;
    performedBy?: string;
    session?: any;
  } = {}
) {
  await dbConnect();
  const logData = {
    medicineId,
    type,
    quantity,
    previousQuantity,
    newQuantity,
    reference,
    unitPrice: options.unitPrice,
    totalAmount: options.totalAmount,
    notes: options.notes,
    batchNumber: options.batchNumber,
    performedBy: options.performedBy,
  };
  const log = new InventoryLog(logData);
  if (options.session) {
    await log.save({ session: options.session });
  } else {
    await log.save();
  }
  return log;
}