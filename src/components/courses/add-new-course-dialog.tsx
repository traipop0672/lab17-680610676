import { useMemo, useState } from "react";
import {
  Controller,
  useFieldArray,
  useForm,
  type DefaultValues,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, RotateCcw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useEnrollmentStore } from "@/lib/enrollment-store";
import {
  createCourseFormSchema,
  type CourseFormValues,
} from "@/lib/schemas/course-schema";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { FieldContent, FieldDescription } from "@/components/ui/field";

const MAX_INSTRUCTORS = 3;
const MAX_DESCRIPTION = 100;

const PROGRAMS = [
  { value: "CPE", label: "CPE — วิศวกรรมคอมพิวเตอร์" },
  { value: "ISNE", label: "ISNE — วิศวกรรมระบบสารสนเทศและเครือข่าย" },
] as const;

const SEMESTERS = [
  { value: "1", label: "ภาคการศึกษาที่ 1" },
  { value: "2", label: "ภาคการศึกษาที่ 2" },
  { value: "3", label: "ภาคฤดูร้อน" },
] as const;

const defaultValues: DefaultValues<CourseFormValues> = {
  courseId: "",
  courseTitle: "",
  instructors: [{ name: "", email: "" }],
  program: undefined,
  semester: undefined,
  description: "",
  notifyByEmail: false, // ค่าเริ่มต้นปิด
};

export function AddNewCourseDialog() {
  const addCourse = useEnrollmentStore((s) => s.addCourse);
  const courses = useEnrollmentStore((s) => s.courses);
  const [open, setOpen] = useState(false);

  const schema = useMemo(() => createCourseFormSchema(courses), [courses]);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "instructors",
  });

  const rootError = form.formState.errors.instructors?.root;

  const descriptionLength = (form.watch("description") ?? "").length;

  const resetForm = () => form.reset(defaultValues);

  const onSubmit = (values: CourseFormValues) => {
    addCourse({
      courseId: values.courseId,
      courseTitle: values.courseTitle.trim(),
      instructors: values.instructors.map((i) => ({
        name: i.name.trim(),
        email: i.email.trim(),
      })),
      program: values.program,
      semester: values.semester,
      description: values.description.trim() || undefined,
      notifyByEmail: values.notifyByEmail,
    });
    resetForm();
    setOpen(false);
  };
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetForm();
      }}
    >
      <DialogTrigger render={<Button />}>
        <PlusCircle className="h-4 w-4" />
        เพิ่มวิชา
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
          className="grid gap-4"
        >
          <DialogHeader>
            <DialogTitle>เพิ่มวิชาใหม่</DialogTitle>
            <DialogDescription>
              กรอกรหัสวิชา ชื่อวิชา และผู้สอน
            </DialogDescription>
          </DialogHeader>

          <Controller
            name="courseId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="courseId">รหัสวิชา</FieldLabel>
                <Input
                  {...field}
                  id="courseId"
                  placeholder="เช่น 261305"
                  inputMode="numeric"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="courseTitle"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="courseTitle">ชื่อวิชา</FieldLabel>
                <Input
                  {...field}
                  id="courseTitle"
                  placeholder="เช่น Mobile Application Development"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* ผู้สอน (Array Fields) */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">ผู้สอน</p>
                <p className="text-sm text-muted-foreground">
                  {fields.length}/{MAX_INSTRUCTORS} คน
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={fields.length >= MAX_INSTRUCTORS}
                onClick={() => append({ name: "", email: "" })}
              >
                <PlusCircle className="h-4 w-4" />
                เพิ่มผู้สอน
              </Button>
            </div>

            {fields.map((item, index) => (
              <div key={item.id} className="flex items-start gap-2">
                <span className="w-6 pt-2 text-sm text-muted-foreground">
                  {index + 1}.
                </span>

                <Controller
                  name={`instructors.${index}.name`}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="flex-1">
                      <Input
                        {...field}
                        placeholder="กรอกชื่อผู้สอน"
                        aria-label={`ชื่อผู้สอนคนที่ ${index + 1}`}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name={`instructors.${index}.email`}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="flex-1">
                      <Input
                        {...field}
                        type="email"
                        placeholder="ต้องเป็นอีเมล @cmu.ac.th"
                        aria-label={`อีเมลผู้สอนคนที่ ${index + 1}`}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`ลบผู้สอนคนที่ ${index + 1}`}
                  disabled={fields.length <= 1}
                  onClick={() => remove(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {rootError && (
              <p role="alert" className="text-sm text-destructive">
                {rootError.message}
              </p>
            )}
          </div>
          {/* 3.1 หลักสูตร */}
          <Controller
            name="program"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="program">ชื่อหลักสูตร</FieldLabel>
                <Select
                  value={field.value ?? ""}
                  onValueChange={(v) => field.onChange(v || undefined)}
                >
                  <SelectTrigger
                    id="program"
                    className="w-full"
                    onBlur={field.onBlur}
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="เลือกหลักสูตร" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROGRAMS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* 3.2 ภาคการศึกษา */}
          <Controller
            name="semester"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>ภาคการศึกษา</FieldLabel>
                <RadioGroup
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                  className="flex flex-wrap gap-4"
                >
                  {SEMESTERS.map((s) => (
                    <div key={s.value} className="flex items-center gap-2">
                      <RadioGroupItem
                        id={`semester-${s.value}`}
                        value={s.value}
                        aria-invalid={fieldState.invalid}
                      />
                      <Label htmlFor={`semester-${s.value}`}>{s.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* 3.3 รายละเอียด */}
          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="description">
                  รายละเอียด (ไม่บังคับ)
                </FieldLabel>
                <Textarea
                  {...field}
                  id="description"
                  aria-invalid={fieldState.invalid}
                />
                <p
                  className={
                    descriptionLength > MAX_DESCRIPTION
                      ? "text-sm text-destructive"
                      : "text-sm text-muted-foreground"
                  }
                >
                  {descriptionLength}/{MAX_DESCRIPTION} ตัวอักษร
                </p>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* 3.4 รับข่าวสารทางอีเมล */}
          <Controller
            name="notifyByEmail"
            control={form.control}
            render={({ field }) => (
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel htmlFor="notifyByEmail">
                    รับข่าวสารทางอีเมล
                  </FieldLabel>
                  <FieldDescription>
                    แจ้งเตือนผู้สอนเมื่อเปิดลงทะเบียน
                  </FieldDescription>
                </FieldContent>
                <Switch
                  id="notifyByEmail"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </Field>
            )}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetForm}>
              <RotateCcw className="h-4 w-4" />
              ล้างฟอร์ม
            </Button>
            <Button type="submit">บันทึก</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
