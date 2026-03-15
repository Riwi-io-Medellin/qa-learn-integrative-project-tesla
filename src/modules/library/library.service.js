// modules/library/library.service.js
import * as libraryRepository from './library.repository.js';

export const createLibraryTest = async (data, id_admin) => {
    const existing = await libraryRepository.findLibraryTestByTestCase(data.id_test_case);
    if (existing) throw new Error('Este test case ya está en la librería');

    const libraryTest = await libraryRepository.createLibraryTest({
        ...data,
        id_admin
    });
    return libraryTest;
};

export const getAllLibraryTests = async () => {
    const libraryTests = await libraryRepository.findAllLibraryTests();
    return libraryTests;
};

export const getLibraryTestById = async (id) => {
    const libraryTest = await libraryRepository.findLibraryTestById(id);
    if (!libraryTest) throw new Error('Test case no encontrado en la librería');
    return libraryTest;
};

export const updateLibraryTest = async (id, data) => {
    const libraryTest = await libraryRepository.findLibraryTestById(id);
    if (!libraryTest) throw new Error('Test case no encontrado en la librería');

    const updated = await libraryRepository.updateLibraryTest(id, data);
    return updated;
};

export const deleteLibraryTest = async (id) => {
    const libraryTest = await libraryRepository.findLibraryTestById(id);
    if (!libraryTest) throw new Error('Test case no encontrado en la librería');

    await libraryRepository.deleteLibraryTest(id);
    return { message: 'Test case eliminado de la librería correctamente' };
};