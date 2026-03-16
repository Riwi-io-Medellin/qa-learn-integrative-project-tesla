import * as libraryRepository from './library.repository.js';

export const createLibraryTest = async (data, id_admin) => {
    // Verificar que el test case existe y no está borrado
    const testCase = await libraryRepository.findActiveTestCase(data.id_test_case);
    if (!testCase) throw new Error('Test case not found or has been deleted');

    // Verificar que no está ya en la librería
    const existing = await libraryRepository.findLibraryTestByTestCase(data.id_test_case);
    if (existing) throw new Error('Este test case ya está en la librería');

    return libraryRepository.createLibraryTest({ ...data, id_admin });
};

export const getAllLibraryTests = async () => {
    return libraryRepository.findAllLibraryTests();
};

export const getLibraryTestById = async (id) => {
    const libraryTest = await libraryRepository.findLibraryTestById(id);
    if (!libraryTest) throw new Error('Test case no encontrado en la librería');
    return libraryTest;
};

export const updateLibraryTest = async (id, data) => {
    const libraryTest = await libraryRepository.findLibraryTestById(id);
    if (!libraryTest) throw new Error('Test case no encontrado en la librería');
    return libraryRepository.updateLibraryTest(id, data);
};

export const deleteLibraryTest = async (id) => {
    const libraryTest = await libraryRepository.findLibraryTestById(id);
    if (!libraryTest) throw new Error('Test case no encontrado en la librería');
    await libraryRepository.deleteLibraryTest(id);
    return { message: 'Test case eliminado de la librería correctamente' };
};
