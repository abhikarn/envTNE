import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'fnWrap',
    standalone: true,
  })
  export class FunctionWrapperPipe implements PipeTransform {
    transform<R>(func: () => R): R;
    transform<ARG, R>(func: (arg: ARG) => R, args: ARG): R;
    transform<ARG1, ARG2, R>(
      func: (arg1: ARG1, arg2: ARG2) => R,
      arg1: ARG1,
      arg2: ARG2
    ): R;
    transform<ARG1, ARG2, ARG3, R>(
      func: (arg1: ARG1, arg2: ARG2, arg3: ARG3) => R,
      arg1: ARG1,
      arg2: ARG2,
      arg3: ARG3
    ): R;
    transform<ARG1, ARG2, ARG3, R>(
      func: (arg1: ARG1, arg2: ARG2, arg3: ARG3, ...arg: any[]) => R,
      arg1: ARG1,
      arg2: ARG2,
      arg3: ARG3,
      ...arg: any[]
    ): R;
  
    transform<R>(func: (...arg: unknown[]) => R, ...args: unknown[]): R {
      return func(...args);
    }
  }