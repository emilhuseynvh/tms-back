import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        // User is set by AuthGuard via ClsService
        // We can access it through the request if ClsService middleware is mounted
        // For now, we'll use a simpler approach - get from request.user if available
        // Otherwise, we'll need to inject ClsService in the controller
        return request.user || request.cls?.get('user');
    },
);

