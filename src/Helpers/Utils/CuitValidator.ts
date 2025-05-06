import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'cuitValidator', async: false })
export class CuitValidator implements ValidatorConstraintInterface {
    validate(cuit: string, args: ValidationArguments) {
        if (!cuit) return false;
        const cleanCuit = cuit.replace(/\D/g, '');
        if (!/^(20|23|24|25|26|27|30|33|34)\d{9}$/.test(cleanCuit)) {
            return false;
        }
        try {
            const digits = cleanCuit.split('').map(Number);
            const checkDigit = digits.pop();
            const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
            let sum = 0;
            for (let i = 0; i < digits.length; i++) {
                sum += digits[i] * multipliers[i];
            }
            const remainder = sum % 11;
            const calculatedCheckDigit = remainder === 0 ? 0 : 11 - remainder;
            return calculatedCheckDigit === checkDigit;
        } catch (error) {
            return false;
        }
    }

    defaultMessage(args: ValidationArguments) {
        return 'CUIT is invalid or has an incorrect checksum';
    }
}