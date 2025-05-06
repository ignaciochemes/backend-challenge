jest.setTimeout(10000);

jest.mock('uuid', () => ({
    v4: jest.fn().mockReturnValue('test-uuid-1234'),
}));

jest.mock('typeorm', () => {
    const original = jest.requireActual('typeorm');
    return {
        ...original,
        DataSource: jest.fn().mockImplementation(() => ({
            initialize: jest.fn().mockResolvedValue({}),
            destroy: jest.fn().mockResolvedValue({}),
            manager: {
                transaction: jest.fn().mockImplementation(callback => callback({})),
            },
        })),
        getRepository: jest.fn().mockReturnValue({
            findOne: jest.fn(),
            find: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue({
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                orWhere: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                getOne: jest.fn(),
                getMany: jest.fn(),
            }),
        }),
    };
});