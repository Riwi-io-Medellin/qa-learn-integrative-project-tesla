// modules/library/library.controller.js
import * as libraryService from './library.service.js';
import catchAsync from '../../middlewares/catchAsync.js';

export const createLibraryTest = catchAsync(async (req, res) => {
    const libraryTest = await libraryService.createLibraryTest(req.body, req.user.id);
    res.status(201).json({ message: 'Test case agregado a la librería correctamente', libraryTest });
});

export const getAllLibraryTests = catchAsync(async (req, res) => {
    const libraryTests = await libraryService.getAllLibraryTests();
    res.status(200).json({ libraryTests });
});

export const getLibraryTestById = catchAsync(async (req, res) => {
    const libraryTest = await libraryService.getLibraryTestById(req.params.id);
    res.status(200).json({ libraryTest });
});

export const updateLibraryTest = catchAsync(async (req, res) => {
    const libraryTest = await libraryService.updateLibraryTest(req.params.id, req.body);
    res.status(200).json({ message: 'Test case actualizado correctamente', libraryTest });
});

export const deleteLibraryTest = catchAsync(async (req, res) => {
    const result = await libraryService.deleteLibraryTest(req.params.id);
    res.status(200).json(result);
});