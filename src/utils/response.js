class Response{
    constructor(statusCode, message= 'Success', data ){
        this.message=message;
        this.data=data;
        this.success=statusCode<400;
        this.statusCode=statusCode;
    }
}

export {Response}