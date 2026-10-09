export const formatCurrency = (value: number | string): string => {
  const num = Number(value) || 0;
  return num.toFixed(2); 
};
