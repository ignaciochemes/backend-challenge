import EnumEnv from '../Enums/EnvEnum';

export const envFilePathConfiguration = (): string => {
    console.log(`Entorno - ${process.env.BC_ENV}`);
    let envFilePath;
    switch (process.env.BC_ENV) {
        case EnumEnv.LOCAL:
            envFilePath = '.env.local';
            break;
        case EnumEnv.DEV:
            envFilePath = '.env.dev';
            break;
        case EnumEnv.PRODUCTION:
            envFilePath = '.env';
            break;
        default:
            envFilePath = '.env';
    }
    console.log(`envFilePath: ` + envFilePath);
    return envFilePath;
};