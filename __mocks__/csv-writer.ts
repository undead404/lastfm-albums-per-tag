const writeRecordsMock = jest.fn();
export const createArrayCsvWriter = jest.fn().mockReturnValue({
  writeRecords: writeRecordsMock,
});
