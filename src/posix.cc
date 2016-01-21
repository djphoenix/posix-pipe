#if defined(_WIN32) || defined(_MSC_VER)
#define WIN
#endif

#include <node.h>
#ifdef WIN
#include <process.h>
#else
#include <unistd.h>
#endif
#include <v8.h>

using namespace v8;

void Pipe(const FunctionCallbackInfo<Value>& args);

void Pipe(const FunctionCallbackInfo<Value>& args) {
    Isolate* isolate = args.GetIsolate();
#ifdef WIN
    args.GetReturnValue().Set(Undefined(isolate));
#else
    int pipefd[2];
    int ret = pipe(pipefd);
    if (ret == -1) {
        args.GetReturnValue().Set(Undefined(isolate));
        return;
    }
    Handle<Array> array = Array::New(isolate, 2);
    array->Set(0,Integer::New(isolate,pipefd[0]));
    array->Set(1,Integer::New(isolate,pipefd[1]));
    args.GetReturnValue().Set(array);
#endif
}

void init(Handle<Object> exports) {
    NODE_SET_METHOD(exports, "pipe", Pipe);
}

NODE_MODULE(posix, init)
