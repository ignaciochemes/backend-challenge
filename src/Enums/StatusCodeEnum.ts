type EnumDictionary<T extends string | symbol | number, U> = {
    [K in T]: U;
};

enum StatusCodeEnums {
    NOT_COMPANIES_FOUND = 10000,
    COMPANY_NOT_FOUND,

    NOT_TRANSFERS_FOUND = 10010,
    TRANSFER_NOT_FOUND,
}

type StatusCodeKeys = keyof typeof StatusCodeEnums;

const sortedKeys: StatusCodeKeys[] = (Object.keys(StatusCodeEnums) as StatusCodeKeys[]).sort((a, b) => StatusCodeEnums[a] - StatusCodeEnums[b]);

const SortedStatusCodeExceptionText: EnumDictionary<StatusCodeKeys, string> = {} as EnumDictionary<StatusCodeKeys, string>;

for (const key of sortedKeys) {
    SortedStatusCodeExceptionText[key] = String(StatusCodeEnums[key]);
}

export { StatusCodeEnums, SortedStatusCodeExceptionText };