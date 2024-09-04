"use client";

import { useState, FormEvent } from "react";
import { getChatCompletion } from "@/lib/openai";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Loader2Icon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  prompt: z.string(),
});

const Home: React.FC = () => {
  const [response, setResponse] = useState<string>("");
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const mutationSend = useMutation({
    mutationFn: (type: string) => {
      return getChatCompletion(type);
    },
    onSuccess: (data) => {
      form.setValue("prompt", "");
      setResponse(data.content);
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    mutationSend.mutateAsync(values.prompt);
  };

  return (
    <Form {...form}>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-lg">
          <FormField
            control={form.control}
            name="prompt"
            render={({ field }) => {
              return (
                <FormItem className="flex w-full flex-col gap-2">
                  <Textarea
                    {...field}
                    placeholder="Enter your text here..."
                    rows={5}
                    className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <button
            onClick={form.handleSubmit(handleSubmit)}
            className="flex flex-row items-center gap-2 mt-4 bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            {mutationSend.isPending ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : null}
            Submit
          </button>
          <div className="mt-4">
            <span className="font-semibold">Response:</span>
            <span className="block text-gray-700 mt-2">
              {response || "No response yet."}
            </span>
          </div>
        </div>
      </div>
    </Form>
  );
};

export default Home;
