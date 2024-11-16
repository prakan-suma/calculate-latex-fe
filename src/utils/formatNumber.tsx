
export const formatNumber = (num: number | undefined | null): string => {
    if (num === undefined || num === null) {
        return '-'; // หรือสามารถคืนค่าอื่นๆ ที่เหมาะสม เช่น '0'
    }
    return num.toLocaleString('th-TH', {
        style: 'decimal',
        maximumFractionDigits: 2,
    });
};

