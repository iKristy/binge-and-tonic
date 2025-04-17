
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Show } from "@/types/Show";
import { Textarea } from "@/components/ui/textarea";

interface AddShowFormProps {
  onAddShow: (show: Omit<Show, "id" | "status">) => void;
  onCancel: () => void;
}

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  imageUrl: z.string().url("Please enter a valid URL").or(z.string().length(0)),
  currentEpisodes: z.coerce.number().int().min(0, "Must be at least 0"),
  episodesNeeded: z.coerce.number().int().min(1, "Must be at least 1"),
  description: z.string().optional(),
  genre: z.string().optional(),
});

const AddShowForm: React.FC<AddShowFormProps> = ({ onAddShow, onCancel }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      imageUrl: "",
      currentEpisodes: 0,
      episodesNeeded: 1,
      description: "",
      genre: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onAddShow({
      title: values.title,
      imageUrl: values.imageUrl || "/placeholder.svg",
      currentEpisodes: values.currentEpisodes,
      episodesNeeded: values.episodesNeeded,
      description: values.description,
      genre: values.genre,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Show Title</FormLabel>
              <FormControl>
                <Input placeholder="Stranger Things" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Poster Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/poster.jpg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="currentEpisodes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Episodes</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="episodesNeeded"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Episodes to Binge</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="genre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Genre</FormLabel>
              <FormControl>
                <Input placeholder="Drama, Sci-Fi, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="A brief description of the show" 
                  className="resize-none"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Add Show</Button>
        </div>
      </form>
    </Form>
  );
};

export default AddShowForm;
