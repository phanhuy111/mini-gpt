"use client";

import { useState, FormEvent, useRef } from "react";
import { getChatCompletion } from "@/lib/openai";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Loader2Icon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { IMessage } from "@/lib/types";

const formSchema = z.object({
  prompt: z.string(),
});

const Home: React.FC = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const mutationSend = useMutation({
    mutationFn: (type: string) => {
      return getChatCompletion(type);
    },
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: "AI", content: data.content }]);
      handleScrollToBottom();
    },
  });

  const handleScrollToBottom = () => {
    if (scrollRef.current) {
      // Scroll to the bottom of the scrollbar
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    form.setValue("prompt", "");
    setMessages((prev) => [...prev, { role: "User", content: values.prompt }]);
    mutationSend.mutateAsync(values.prompt);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // Prevent default newline behavior
      form.handleSubmit(handleSubmit)(); // Manually trigger submit
    }
  };

  return (
    <Form {...form}>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 py-12">
        <ScrollArea
          ref={scrollRef}
          className="max-h-[500px] flex-1 w-full max-w-lg bg-white p-4 overflow-y-auto"
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-2 my-2 rounded-lg ${
                msg.role === "User"
                  ? "bg-blue-100 self-end"
                  : "bg-gray-100 self-start"
              }`}
            >
              <span
                className={`font-semibold mr-1 ${
                  msg.role === "User" ? "text-blue-600" : "text-gray-600"
                }`}
              >
                {msg.role}:
              </span>
              {msg.content}
            </div>
          ))}
        </ScrollArea>

        <div className="bg-white p-6 w-full max-w-lg">
          <FormField
            control={form.control}
            name="prompt"
            render={({ field }) => {
              return (
                <FormItem className="flex w-full flex-col gap-2">
                  <Textarea
                    {...field}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter your text here..."
                    rows={5}
                    className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <Button
            disabled={mutationSend.isPending}
            onClick={form.handleSubmit(handleSubmit)}
            className="flex flex-row items-center gap-2 mt-4 bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            {mutationSend.isPending ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : null}
            Submit
          </Button>
        </div>
      </div>
    </Form>
  );
};

export default Home;
