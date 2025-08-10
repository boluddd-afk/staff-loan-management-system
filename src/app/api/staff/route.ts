import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/staff - Get all staff members
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeLoans = searchParams.get('includeLoans') === 'true';

    const staff = await prisma.staff.findMany({
      include: {
        loans: includeLoans ? {
          include: {
            payments: true
          }
        } : false
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    );
  }
}

// POST /api/staff - Create a new staff member
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, department, employeeId } = body;

    // Validate required fields
    if (!name || !email || !department || !employeeId) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, department, employeeId' },
        { status: 400 }
      );
    }

    // Check if email or employeeId already exists
    const existingStaff = await prisma.staff.findFirst({
      where: {
        OR: [
          { email },
          { employeeId }
        ]
      }
    });

    if (existingStaff) {
      return NextResponse.json(
        { error: 'Staff member with this email or employee ID already exists' },
        { status: 409 }
      );
    }

    // Create the staff member
    const staff = await prisma.staff.create({
      data: {
        name,
        email,
        department,
        employeeId
      }
    });

    return NextResponse.json(staff, { status: 201 });
  } catch (error) {
    console.error('Error creating staff:', error);
    return NextResponse.json(
      { error: 'Failed to create staff member' },
      { status: 500 }
    );
  }
}
