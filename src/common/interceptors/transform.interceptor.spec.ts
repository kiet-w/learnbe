import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { TransformInterceptor } from './transform.interceptor';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<any>;

  beforeEach(() => {
    interceptor = new TransformInterceptor();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should transform response data into the new format', (done) => {
    const mockData = { id: 1, name: 'Test' };
    const mockContext = {
      switchToHttp: jest.fn().mockReturnThis(),
      getResponse: jest.fn().mockReturnValue({ statusCode: 200 }),
    } as unknown as ExecutionContext;

    const mockCallHandler = {
      handle: jest.fn().mockReturnValue(of(mockData)),
    } as CallHandler;

    interceptor
      .intercept(mockContext, mockCallHandler)
      .subscribe((response) => {
        expect(response).toEqual({
          statusCode: 200,
          message: 'Thành công',
          data: mockData,
        });
        done();
      });
  });

  it('should return null data if data is undefined', (done) => {
    const mockContext = {
      switchToHttp: jest.fn().mockReturnThis(),
      getResponse: jest.fn().mockReturnValue({ statusCode: 201 }),
    } as unknown as ExecutionContext;

    const mockCallHandler = {
      handle: jest.fn().mockReturnValue(of(undefined)),
    } as CallHandler;

    interceptor
      .intercept(mockContext, mockCallHandler)
      .subscribe((response) => {
        expect(response).toEqual({
          statusCode: 201,
          message: 'Thành công',
          data: null,
        });
        done();
      });
  });

  it('should not transform if data already has statusCode and message', (done) => {
    const alreadyFormattedData = {
      statusCode: 200,
      message: 'Custom message',
      data: { result: 'ok' },
    };
    const mockContext = {
      switchToHttp: jest.fn().mockReturnThis(),
      getResponse: jest.fn().mockReturnValue({ statusCode: 200 }),
    } as unknown as ExecutionContext;

    const mockCallHandler = {
      handle: jest.fn().mockReturnValue(of(alreadyFormattedData)),
    } as CallHandler;

    interceptor
      .intercept(mockContext, mockCallHandler)
      .subscribe((response) => {
        expect(response).toEqual(alreadyFormattedData);
        done();
      });
  });
});
