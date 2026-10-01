import { z } from "zod";

const instructorSchema = z.object({
  name: z.string().trim().min(1, "กรุณากรอกชื่อผู้สอน"),
  email: z
    .string()
    .trim()
    .email("รูปแบบอีเมลไม่ถูกต้อง")
    .endsWith("@cmu.ac.th", "ต้องเป็นอีเมล @cmu.ac.th"),
});

export const createCourseFormSchema = (courses: { courseId: string }[]) =>
  z.object({
    courseId: z
      .string()
      .regex(/^\d{6}$/, "รหัสวิชาต้องเป็นตัวเลข 6 หลัก")
      .refine(
        (id) => !courses.some((c) => c.courseId === id),
        "รหัสวิชานี้มีอยู่แล้ว",
      ),
    courseTitle: z
      .string()
      .trim()
      .min(1, "กรุณากรอกชื่อวิชา")
      .max(100, "ชื่อวิชาต้องไม่เกิน 100 ตัวอักษร"),
    instructors: z
      .array(instructorSchema)
      .min(1, "ต้องมีผู้สอนอย่างน้อย 1 คน")
      .max(3, "มีผู้สอนได้ไม่เกิน 3 คน")
      .refine((list) => {
        const emails = list
          .map((i) => i.email.trim().toLowerCase())
          .filter(Boolean);
        return new Set(emails).size === emails.length;
      }, "อีเมลผู้สอนซ้ำกัน"),

    program: z.enum(["CPE", "ISNE"], { message: "เลือกหลักสูตร" }),
    semester: z.enum(["1", "2", "3"], { message: "เลือกภาคการศึกษา" }),
    description: z.string().max(100, "รายละเอียดต้องไม่เกิน 100 ตัวอักษร"),
    notifyByEmail: z.boolean(),
  });

export type CourseFormValues = z.infer<
  ReturnType<typeof createCourseFormSchema>
>;
